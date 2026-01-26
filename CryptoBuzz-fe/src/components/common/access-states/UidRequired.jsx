
import React from 'react';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

export function UidRequired({ onConnectUid, onClose }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 m-4 !mb-0 text-center bg-gray-50 dark:bg-[#fff9e224] border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="bg-gray-200 dark:bg-[#fff9e224] p-4 rounded-full mb-4">
                <Key className="w-8 h-8 text-gray-500 dark:text-yellow-500" />
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">UID Required</h3>
                <p className="text-gray-500 max-w-sm">
                    This content requires a valid UID to access. Please connect your UID to continue accessing this exclusive content.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={onConnectUid} className="w-full sm:w-auto">
                        Connect UID
                    </Button>
                    {onClose && (
                        <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
