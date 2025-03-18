import { Move, Scaling, Workflow } from 'lucide-react';
 
const Toolbar = () => {
    return (
        <div className="fixed top-12 bg-white h-8 w-screen z-20 border-b border-[#9facbc] text-[#61656E] dark:text-white">
            <div className='flex items-center h-full gap-4 px-4 pl-5'>
                <div className="toolbar__logo">
                    <Move className="w-5 h-5" />
                </div>
                <div className="toolbar__nav">
                    <Scaling className="w-5 h-5" />
                </div>
                <div className="toolbar__actions">
                    <Workflow className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

export default Toolbar;