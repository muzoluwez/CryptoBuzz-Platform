import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function AcademyPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Academy" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Academy</h2>
          <p className="text-muted-foreground">
            Learn about cryptocurrencies and blockchain technology.
          </p>
        </div>
      </div>
    </>
  );
}

