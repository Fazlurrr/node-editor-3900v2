import { Move, Scaling, Workflow, Clipboard, ClipboardPaste,
    Scissors, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Fullscreen, Lock} from 'lucide-react';
 
const Toolbar = () => {
    return (
        <div className="fixed top-12 bg-white h-8 w-screen z-20 border-b border-[#9facbc] text-[#61656E] dark:text-white dark:bg-navbar-dark">
            <div className='flex items-center h-full gap-4 px-4 pl-5'>
                <div title="Move (V)">
                    <Move className="w-5 h-5" />
                </div>
                <div title="Transform (T)">
                    <Scaling className="w-5 h-5" />
                </div>
                <div title="Relation (R)">
                    <Workflow className="w-5 h-5" />
                </div>
                <div className='w-0.5 h-5 bg-[#B7C0CD]'></div>
                <div title="Copy (Ctrl+C)">
                    <Clipboard className="w-5 h-5" />
                </div>
                <div title="Paste (Ctrl+V)">
                    <ClipboardPaste className="w-5 h-5" />
                </div>
                <div title="Cut (Ctrl+X)">
                    <Scissors className="w-5 h-5" />
                </div>
                <div title="Delete (Backspace)">
                    <Trash2 className="w-5 h-5" />
                </div>
                <div className='w-0.5 h-5 bg-[#B7C0CD]'></div>
                <div title="Undo (Ctrl+Z)">
                    <Undo2 className="w-5 h-5" />
                </div>
                <div title="Redo (Ctrl+Shift+Z)">
                    <Redo2 className="w-5 h-5" />
                </div>
                <div className='w-0.5 h-5 bg-[#B7C0CD]'></div>
                <div title="Zoom In (+)">
                    <ZoomIn className="w-5 h-5" />
                </div>
                <div title="Zoom Out (-)">
                    <ZoomOut className="w-5 h-5" />
                </div>
                <div title="Fit View (Ctrl+F)">
                    <Fullscreen className="w-5 h-5" />
                </div>
                <div title="Lock Movement (Ctrl+L)">
                    <Lock className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

export default Toolbar;