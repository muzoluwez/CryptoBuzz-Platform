import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function IdeaPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Ideas" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Ideas</h2>
          <p className="text-muted-foreground">
            Explore trading ideas and investment opportunities.
          </p>
        </div>
      </div>
    </>
  );
}

