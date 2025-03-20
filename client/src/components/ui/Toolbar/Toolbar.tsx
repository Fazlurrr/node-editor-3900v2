import { Move, Scaling, Workflow, Clipboard, ClipboardPaste,
    Scissors, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Fullscreen, Lock, Unlock} from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { useMode } from '@/hooks/useMode';
import { useReactFlow } from 'reactflow';

interface ToolbarProps {
    isLocked: boolean;
    onLockToggle: () => void;
}


const Toolbar = ({ isLocked, onLockToggle }: ToolbarProps) => {
    const { mode, setMode } = useMode();
    const { selectedElement, copy, cut, paste, handlePaste, handleTriggerDelete } = useClipboard();
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const iconStyle = 'w-5 h-5 ml-1.5 mt-1.5';
    const iconContainerStyle = 'w-8 h-full hover:text-black dark:hover:text-white mr-1';
    const activeIconContainerStyle = 'bg-gray-200 dark:bg-gray-700';
    const dividerStyle = 'w-0.5 h-5 bg-[#B7C0CD] ml-4 mr-5';

    return (
        <div className="fixed top-12 bg-white h-8 w-screen z-20 border-b border-[#9facbc] text-[#61656E] dark:text-gray-300 dark:bg-navbar-dark">
            <div className='flex items-center h-full px-4 pl-5'>
                <div 
                    title="Move (V)" 
                    onClick={() => setMode('move')} 
                    className={`${iconContainerStyle} ${mode === 'move' ? activeIconContainerStyle : ''}`}
                >
                    <Move className={iconStyle} />
                </div>
                <div 
                    title="Transform (T)" 
                    onClick={() => setMode('transform')} 
                    className={`${iconContainerStyle} ${mode === 'transform' ? activeIconContainerStyle : ''}`}
                >
                    <Scaling className={iconStyle} />
                </div>
                <div 
                    title="Relation (R)" 
                    onClick={() => setMode('relation')} 
                    className={`${iconContainerStyle} ${mode === 'relation' ? activeIconContainerStyle : ''}`}
                >
                    <Workflow className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Copy (Ctrl+C)" className={iconContainerStyle}
                    onClick={() => { if (selectedElement) copy(selectedElement); }}
                >
                    <Clipboard className={iconStyle} />
                </div>
                <div title="Paste (Ctrl+V)" className={iconContainerStyle}
                    onClick={() => paste(handlePaste)}
                >
                    <ClipboardPaste className={iconStyle} />
                </div>
                <div title="Cut (Ctrl+X)" className={iconContainerStyle}
                    onClick={() => { if (selectedElement) cut(selectedElement, handleTriggerDelete); }}
                >
                    <Scissors className={iconStyle} />
                </div>
                <div title="Delete (Backspace)" className={iconContainerStyle} 
                    onClick={() => { if (selectedElement) handleTriggerDelete(); }}
                >
                    <Trash2 className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Undo (Ctrl+Z)" className={iconContainerStyle}>
                    <Undo2 className={iconStyle} />
                </div>
                <div title="Redo (Ctrl+Shift+Z)" className={iconContainerStyle}>
                    <Redo2 className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Zoom In (.)" className={iconContainerStyle}
                    onClick={() => zoomIn({ duration: 100 })}
                >
                    <ZoomIn className={iconStyle} />
                </div>
                <div title="Zoom Out (-)" className={iconContainerStyle}
                    onClick={() => zoomOut({ duration: 100 })}
                >
                    <ZoomOut className={iconStyle} />
                </div>
                <div title="Fit View (F)" className={iconContainerStyle}
                    onClick={() => fitView({ duration: 300, padding: 0.1 })}
                >
                    <Fullscreen className={iconStyle} />
                </div>
                <div title="Lock Movement (Ctrl+L)" className={`${iconContainerStyle} ${isLocked ? activeIconContainerStyle : ''}`}
                    onClick={onLockToggle}>
                    {isLocked ? <Lock className={iconStyle} /> : <Unlock className={iconStyle} />}
                </div>
            </div>
        </div>
    );
}

export default Toolbar;