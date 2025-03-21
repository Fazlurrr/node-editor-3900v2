import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CanvasMenuProps {
    x: number;
    y: number;
    onMoveToFront: () => void;
    onMoveToBack: () => void;
    onClose: () => void;
    onTerminalDetach: () => void;
    nodeType?: string;
    hasParent?: boolean;
}

const CanvasMenu: React.FC<CanvasMenuProps> = ({ x, y, onMoveToFront, onMoveToBack, onClose, onTerminalDetach, nodeType, hasParent }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const liStyle = "p-2 hover:bg-gray-100 dark:bg-[#232528] dark:hover:bg-gray-700 cursor-pointer";    

    useEffect(() => {
        menuRef.current?.focus();
    }, []);

    return (
        <div
            ref={menuRef}
            tabIndex={0}
            className={cn("absolute  border shadow-lg rounded z-50")}
            style={{ top: y, left: x, width: "150px" }}
            onBlur={onClose}
        >
            <ul>
                <li
                    className={liStyle}
                    onClick={() => {
                        onMoveToFront();
                        onClose();
                    }}
                >
                    Move to Front
                </li>
                <li
                    className={liStyle}
                    onClick={() => {
                        onMoveToBack();
                        onClose();
                    }}
                >
                    Move to Back
                </li>
                {nodeType === 'terminal' && hasParent && (
                    <li className={liStyle} onClick={() => { onTerminalDetach(); onClose(); }}>
                        Detach terminal
                    </li>
                )}
            </ul>
        </div>
    );
};

export default CanvasMenu;
