import { useState } from "react";
import { buttonVariants } from '@/lib/config.ts';
import { Button } from '@/components/ui/Misc/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialProps {
    close: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({close}) => {
    const [pageNumber, setPageNumber] = useState<number>(1);
    return (
        <div className='p-6 flex flex-col h-full'>
            <div>
                {(() => {
                    switch (pageNumber) {
                        case 1:
                            return (
                                <div className="flex flex-row items-center gap-4 ">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Welcome to IMF Editor</h2>
                                        <p>
                                            IMF Editor is a tool for modelling within the
                                            <a className="text-blue-500 hover:underline cursor-pointer" onClick={() => window.open('https://sirius-labs.no/imf/')} title="sirius-labs.no/imf"> Information Modelling Framework (IMF).</a>
                                            <br/>
                                            The editor allows you to create and edit elements, and connect them with relations.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-welcome.png" alt="Tutorial Welcome" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 2:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Creating elements</h2>
                                        <p>
                                            To create a new element, you can drag an element from the left sidebar onto the middle canvas.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-elements.png" alt="Tutorial Elements" className="w-full"/>
                                    </div>
                                </div>
                            );
                        
                        case 3:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Toolbar</h2>
                                        <p className='mb-4'>
                                            The Toolbar is located at the top of the page, and features functionality for changing modes, clipboard, undo/redo and canvas controls.
                                            <br/><br/>
                                            You can also access these functions using keyboard shortcuts, which are shown when you hover over the buttons.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-toolbar.png" alt="Tutorial Toolbar" className="w-full"/>
                                    </div>
                                </div>
                            );

                        case 4:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Creating relations</h2>
                                        <p className='mb-4'>Enter selection mode from the toolbar or by selecting a relation type in the left sidebar. Then click and drag between the connection handles on the elements you want to connect.</p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-relations.png" alt="Tutorial Relations" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 5:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Attaching Terminals</h2>
                                        <p className='mb-4'>To attach a terminal to a block, drag it from the left sidebar and drop it onto the block.</p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-terminal.png" alt="Tutorial Terminal" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 6:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Element Properties</h2>
                                        <p className='mb-4'>
                                            To view an element or relations properties, simply click on them and they will appear in the right sidebar.
                                            <br/><br/>
                                            From here you are also able to edit name, aspect, attributes and relation type.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-properties.png" alt="Tutorial Properties" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 7:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Attributes</h2>
                                        <p className='mb-4'>
                                            To add custom attributes to an element, click on the plus-sign next to "Custom Attributes" in the right sidebar.
                                            <br/><br/>
                                            This opens a window where you can specify attribute name, value, unit and quality datums.
                                            <br/>
                                            To edit or delete an attribute, click on the minus or pencil icons in the attribute list to the right.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-attributes.png" alt="Tutorial Attributes" className="w-full"/>
                                    </div>
                                </div>
                            );
                        default:
                            return null;
                        }
                    })()
                }
            </div>

            <div className="align-bottom flex justify-center mt-4">
                <Button 
                    className={`${buttonVariants.confirm} px-2`} 
                    variant="outline" 
                    onClick={() => setPageNumber(pageNumber - 1)} 
                    disabled={pageNumber <= 1}
                >
                    <ChevronLeft />
                </Button>
                <div className="w-14 p-2 font-semibold text-center">
                    {pageNumber}/7
                </div>
                {pageNumber < 7 ? (
                    <Button 
                        className={`${buttonVariants.confirm} px-2`} 
                        variant="outline" 
                        onClick={() => setPageNumber(pageNumber + 1)} 
                        disabled={pageNumber >= 7}
                    >
                        <ChevronRight />
                    </Button>
                ) : (
                    <Button 
                        className={`${buttonVariants.confirm} px-2`} 
                        variant="outline" 
                        onClick={close}
                    >
                        Done
                    </Button>
                )}
            </div>
          
        </div>
    )
}
export default Tutorial;