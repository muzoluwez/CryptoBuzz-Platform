import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function JournalingPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Journaling" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Journaling</h2>
          <p className="text-muted-foreground">
            Track your trading journey and notes.
          </p>
        </div>
      </div>
    </>
  );
}

