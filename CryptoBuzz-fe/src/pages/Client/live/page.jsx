import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function LivePage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Live" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Live</h2>
          <p className="text-muted-foreground">
            Real-time cryptocurrency market data and updates.
          </p>
        </div>
      </div>
    </>
  );
}

