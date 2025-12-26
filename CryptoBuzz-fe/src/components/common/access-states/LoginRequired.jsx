
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function LoginRequired({ onLogin }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Login Required</h3>
                <p className="text-gray-500 max-w-sm">
                    This content is valid for logged-in users only. Please log in to continue accessing exclusive insights and ideas.
                </p>
                <Button onClick={onLogin} className="w-full sm:w-auto">
                    Log In
                </Button>
            </div>
        </div>
    );
}
