import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function HomePage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Home" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Welcome to CryptoBuzz</h2>
          <p className="text-muted-foreground">
            Your central hub for cryptocurrency insights and analysis.
          </p>
        </div>
      </div>
    </>
  );
}

