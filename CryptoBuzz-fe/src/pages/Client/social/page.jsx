import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function SocialPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Social" />
      </Toolbar>
      <div className="container">
        <div className="rounded-lg p-6 bg-background">
          <h2 className="text-2xl font-semibold mb-4">Social</h2>
          <p className="text-muted-foreground">
            Connect with the crypto community and share insights.
          </p>
        </div>
      </div>
    </>
  );
}

