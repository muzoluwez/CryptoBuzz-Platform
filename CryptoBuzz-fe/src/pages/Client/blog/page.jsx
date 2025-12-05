import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function BlogPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Blog" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Blog</h2>
          <p className="text-muted-foreground">
            Latest articles and insights about cryptocurrency.
          </p>
        </div>
      </div>
    </>
  );
}

