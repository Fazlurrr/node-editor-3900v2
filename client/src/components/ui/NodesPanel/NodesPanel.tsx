import React from 'react';

const NodesPanel: React.FC = () => {
    return (
        <div 
            className="h-full w-56 text-white border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 left-0 z-10"
        >
            <div className="p-4 mt-14 mb-2 border-b border-[#9facbc]">
            <h2 className="text-lg text-black font-semibold">Elements</h2>
            </div>
            <div className="mb-1 border-b border-[#9facbc]">
            <h3 className="ml-4 text-black">Function</h3>
            <div className="flex justify-center gap-2 pb-2">
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-10 h-10 bg-[#ffff00] border border-black"></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-8 h-8 bg-[#ffff00] bg-opacity-35 border border border-gray-400"><span className="block mt-2 ml-6 w-4 h-4 bg-[#ffff00] border border-black"></span></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-5 w-6 h-6 bg-[#ffff00] border border-black rounded-full"></span></button>
            </div>
            </div>
            <div className="mb-1 border-b border-[#9facbc]">
            <h3 className="ml-4 text-black">Product</h3>
            <div className="flex justify-center gap-2 pb-2">
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-10 h-10 bg-[#ff00ff] border border-black"></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-8 h-8 bg-[#ff00ff] bg-opacity-35 border border border-gray-400"><span className="block mt-2 ml-6 w-4 h-4 bg-[#ff00ff] border border-black"></span></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-5 w-6 h-6 bg-[#ff00ff] border border-black rounded-full"></span></button>
            </div>
            </div>
            <div className="mb-1 border-b border-[#9facbc]">
            <h3 className="ml-4 text-black">Location</h3>
            <div className="flex justify-center gap-2 pb-2">
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-10 h-10 bg-[#00ffff] border border-black"></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-8 h-8 bg-[#00ffff] bg-opacity-35 border border border-gray-400"><span className="block mt-2 ml-6 w-4 h-4 bg-[#00ffff] border border-black"></span></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-5 w-6 h-6 bg-[#00ffff] border border-black rounded-full"></span></button>
            </div>
            </div>
            <div className="mb-1 border-b border-[#9facbc]">
            <h3 className="ml-4 text-black">Installed</h3>
            <div className="flex justify-center gap-2 pb-2">
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-10 h-10 bg-[#424bb2] border border-black"></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-8 h-8 bg-[#424bb2] bg-opacity-35 border border border-gray-400"><span className="block mt-2 ml-6 w-4 h-4 bg-[#424bb2] border border-black"></span></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-5 w-6 h-6 bg-[#424bb2] border border-black rounded-full"></span></button>
            </div>
            </div>
            <div className="mb-1 border-b border-[#9facbc]">
            <h3 className="ml-4 text-black">Unspecified</h3>
            <div className="flex justify-center gap-2 pb-2">
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-10 h-10 bg-[#cccccc] border border-black"></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-3 w-8 h-8 bg-[#cccccc] bg-opacity-35 border border border-gray-400"><span className="block mt-2 ml-6 w-4 h-4 bg-[#cccccc] border border-black"></span></span></button>
                <button className="w-16 h-16 text-left text-black hover:bg-gray-200"><span className="block ml-5 w-6 h-6 bg-[#cccccc] border border-black rounded-full"></span></button>
            </div>
            </div>
        </div>
    );
};

export default NodesPanel;
