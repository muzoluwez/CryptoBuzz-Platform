import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function AnalysisPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Analysis" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Analysis</h2>
          <p className="text-muted-foreground">
            In-depth cryptocurrency market analysis and trends.
          </p>
        </div>
      </div>
    </>
  );
}

