import React from 'react';
import { Container } from '@/components/container';
import {
    Toolbar,
    ToolbarActions,
    ToolbarDescription,
    ToolbarHeading,
    ToolbarPageTitle,
} from '@/partials/toolbar';
import AdminCommunityFeed from '../admin-community-feed/AdminCommunityFeed';

/**
 * Social Buzz Page
 * 
 * Admin view of the social/community feed where educators and users interact.
 * This page displays posts, interactions, and community activities.
 */
const IqSocial = () => {
    return (
        <div className="container-fluid pb-5">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle text="Social Buzz" />
                    <ToolbarDescription>
                        View and manage community posts, interactions, and social activities from educators and users.
                    </ToolbarDescription>
                </ToolbarHeading>
                <ToolbarActions>
                    <div className="text-end pb-4">
                        {/* Add any action buttons here if needed */}
                    </div>
                </ToolbarActions>
            </Toolbar>

            {/* Community Feed Component */}
            <div className="card">
                <div className="card-body">
                    <AdminCommunityFeed />
                </div>
            </div>
        </div>
    );
};

export default IqSocial;
