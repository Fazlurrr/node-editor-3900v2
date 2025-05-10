const KeyboardShortcuts = () => {
    return (
        <div className="pb-12">
            <div className="p-4 flex flex-row gap-24 justify-center">
                <div className="text-left">
                    <div className="space-y-4 max-w-xl mx-auto"> {/* Set a max-width */}
                        {/* Shortcut List */}
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Delete / Backspace</span>
                            <span className="text-gray-600 ml-4">Delete selected element</span> {/* Add left margin */}
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Ctrl + C / Cmd + C</span>
                            <span className="text-gray-600 ml-4">Copy selected elements</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Ctrl + X / Cmd + X</span>
                            <span className="text-gray-600 ml-4">Cut selected elements</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Ctrl + V / Cmd + V</span>
                            <span className="text-gray-600 ml-4">Paste elements</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">V</span>
                            <span className="text-gray-600 ml-4">Switch to move mode</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">T</span>
                            <span className="text-gray-600 ml-4">Switch to transform mode</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">R</span>
                            <span className="text-gray-600 ml-4">Switch to relation mode</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">.</span>
                            <span className="text-gray-600 ml-4">Zoom in</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">-</span>
                            <span className="text-gray-600 ml-4">Zoom out</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">F</span>
                            <span className="text-gray-600 ml-4">Fit view</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">L</span>
                            <span className="text-gray-600 ml-4">Lock elements</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Ctrl + Shift + G</span>
                            <span className="text-gray-600 ml-4">Toggle grid visibility</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Ctrl + Shift + M</span>
                            <span className="text-gray-600 ml-4">Toggle mini-map visibility</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">S</span>
                            <span className="text-gray-600 ml-4">Switch direction of selected edge</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">D</span>
                            <span className="text-gray-600 ml-4">Detach selected terminal from block</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;
