
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function UpgradeRequired({ allowedPlans = [], onUpgrade }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Upgrade to {allowedPlans?.join(' or ')}</h3>
                <p className="text-gray-500 max-w-sm">
                    This content is available exclusively under the {allowedPlans?.join(', ')} plan.
                    Upgrade your account to unlock this and more.
                </p>
                <Button onClick={onUpgrade} variant="default" className="w-full sm:w-auto">
                    Upgrade Plan
                </Button>
            </div>
        </div>
    );
}
