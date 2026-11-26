// Mounts feature screens (interview, scene, deduction, notebook, finale) without a static import, so the shell
// runs before a feature folder exists and picks it up when it lands (Metro's require.context watches the folder).
// A feature that is missing shows a plain "being built" state; one that throws while rendering shows an error
// state with a retry instead of taking the desk down.
import { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Eyebrow, T } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { t as translate } from '../../i18n';
import { color, space } from '../../theme/tokens';

export type FeatureName = 'interview' | 'scene' | 'deduction' | 'notebook' | 'finale';

type Ctx = { keys(): string[]; (id: string): Promise<unknown> };

function context(): Ctx | null {
  try {
    // top-level files of each feature folder only; names with a second dot (x.test.ts, x.web.tsx) are skipped.
    // 'lazy': each file becomes its own async chunk, so a feature that fails to compile only fails here.
    return require.context('..', true, /^\.\/(interview|scene|deduction|notebook|finale)\/[A-Za-z0-9_-]+\.tsx?$/, 'lazy') as unknown as Ctx;
  } catch {
    return null;
  }
}

const cache = new Map<string, ComponentType<any>>();

const isComponent = (x: unknown) => typeof x === 'function' || (typeof x === 'object' && x !== null && '$$typeof' in x);

/** Candidate files for `exportName` in the feature folder: index first, then a file named like the export, then the rest. */
function candidates(feature: FeatureName, exportName: string): string[] {
  const ctx = context();
  if (!ctx) return [];
  const prefix = `./${feature}/`;
  const keys = ctx.keys().filter((k) => k.startsWith(prefix) && !/\/(strings|types)\.tsx?$/.test(k));
  const rank = (k: string) => {
    const base = k.slice(prefix.length).replace(/\.tsx?$/, '');
    if (base === 'index') return 0;
    if (base === exportName) return 1;
    return k.endsWith('.tsx') ? 2 : 3;
  };
  return keys.sort((a, b) => rank(a) - rank(b));
}

/** Loads `exportName` from the feature folder. null = the folder or the export does not exist (yet). */
export async function loadFeature<P>(feature: FeatureName, exportName: string): Promise<ComponentType<P> | null> {
  const cacheKey = `${feature}:${exportName}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit as ComponentType<P>;
  const ctx = context();
  if (!ctx) return null;
  let lastError: unknown = null;
  for (const key of candidates(feature, exportName)) {
    try {
      const mod = (await ctx(key)) as Record<string, unknown> | undefined;
      const found = mod?.[exportName];
      if (isComponent(found)) {
        cache.set(cacheKey, found as ComponentType<any>);
        return found as ComponentType<P>;
      }
    } catch (e) {
      lastError = e; // a file that fails to load: try the next one
    }
  }
  if (lastError) throw lastError;
  return null;
}

type LoadState<P> = { status: 'loading' } | { status: 'missing' } | { status: 'error'; message: string } | { status: 'ready'; Comp: ComponentType<P> };

export function useFeature<P>(feature: FeatureName, exportName: string): LoadState<P> {
  const cached = cache.get(`${feature}:${exportName}`) as ComponentType<P> | undefined;
  const [state, setState] = useState<LoadState<P>>(cached ? { status: 'ready', Comp: cached } : { status: 'loading' });
  useEffect(() => {
    if (cached) return;
    let alive = true;
    loadFeature<P>(feature, exportName)
      .then((Comp) => { if (alive) setState(Comp ? { status: 'ready', Comp } : { status: 'missing' }); })
      .catch((e: unknown) => { if (alive) setState({ status: 'error', message: e instanceof Error ? e.message.split('\n')[0] : String(e) }); });
    return () => { alive = false; };
  }, [feature, exportName, cached]);
  return state;
}

export function BeingBuilt({ feature, onBack, children }: { feature: FeatureName; onBack?: () => void; children?: ReactNode }) {
  return (
    <View style={s.center} testID={`being-built-${feature}`}>
      <Icon name="note" size={28} tint={color.textFaint} />
      <Eyebrow style={{ marginTop: space.md }}>{translate(`desk.feature.${feature}`)}</Eyebrow>
      <T v="title" style={{ marginTop: space.sm, textAlign: 'center' }}>{translate('desk.building.title')}</T>
      <T v="bodyDim" style={{ marginTop: space.sm, textAlign: 'center', maxWidth: 300 }}>{translate('desk.building.text')}</T>
      {children}
      {onBack ? <Button label={translate('desk.building.back')} kind="secondary" onPress={onBack} style={{ marginTop: space.lg }} /> : null}
    </View>
  );
}

interface BoundaryProps { feature: FeatureName; onBack?: () => void; children: ReactNode }

/** Keeps a crashing feature inside its own frame. */
export class FeatureBoundary extends Component<BoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) {
    console.warn(`[desk] feature "${this.props.feature}" crashed:`, error?.message);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={s.center}>
        <Eyebrow>{translate(`desk.feature.${this.props.feature}`)}</Eyebrow>
        <T v="title" style={{ marginTop: space.sm, textAlign: 'center' }}>{translate('desk.crashed.title')}</T>
        <T v="small" style={{ marginTop: space.sm, textAlign: 'center', maxWidth: 300 }}>{this.state.error.message}</T>
        <Button label={translate('common.retry')} kind="secondary" onPress={() => this.setState({ error: null })} style={{ marginTop: space.lg }} />
        {this.props.onBack ? <Button label={translate('desk.building.back')} kind="ghost" onPress={this.props.onBack} style={{ marginTop: space.sm }} /> : null}
      </View>
    );
  }
}

/** Renders a feature's component if it exists, else the "being built" state. */
export function Feature<P extends object>({ feature, exportName, props, onBack, fallback }: {
  feature: FeatureName; exportName: string; props: P; onBack?: () => void; fallback?: ReactNode;
}) {
  const state = useFeature<P>(feature, exportName);
  if (state.status === 'loading') return <View style={s.center}><ActivityIndicator color={color.textDim} /></View>;
  if (state.status === 'missing') return <BeingBuilt feature={feature} onBack={onBack}>{fallback}</BeingBuilt>;
  if (state.status === 'error') {
    console.warn(`[desk] feature "${feature}" failed to load:`, state.message);
    return <BeingBuilt feature={feature} onBack={onBack}>{fallback}</BeingBuilt>;
  }
  const { Comp } = state;
  return (
    <FeatureBoundary feature={feature} onBack={onBack}>
      <Comp {...props} />
    </FeatureBoundary>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: color.bg },
});
