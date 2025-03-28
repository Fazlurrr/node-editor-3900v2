import { useState } from "react";
import { buttonVariants } from '@/lib/config.ts';
import { Button } from '@/components/ui/button';
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
                                            IMF Editor is a tool for designing within the
                                            <a className="text-blue-500 hover:underline cursor-pointer" onClick={() => window.open('https://sirius-labs.no/imf/')} title="sirius-labs.no/imf"> Information Modelling Framework (IMF).</a>
                                            <br/>
                                            The editor allows you to create and edit elements, and connect them with relations.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-1.png" alt="Tutorial 1" className="w-full"/>
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
                                        <img src="/tutorial-images/tutorial-2.png" alt="Tutorial 2" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 3:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Creating relations</h2>
                                        <p className='mb-4'>Enter selection mode from the toolbar or by selecting a relation type in the left sidebar. Then click and drag between the connection handles on the elements you want to connect.</p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-3.png" alt="Tutorial 3" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 4:
                            return (
                                <div className="flex flex-row items-center gap-4">
                                    <div className='mb-4 w-1/2'>
                                        <h2 className="text-lg font-semibold mb-2">Element properties</h2>
                                        <p className='mb-4'>
                                            To view an element or relations properties, simply click on them and they will appear in the right sidebar.
                                            <br/><br/>
                                            From here you are also able to edit name, aspect, attributes and relation type.
                                        </p>
                                    </div>
                                    <div className="w-1/2 border-2 border-black">
                                        <img src="/tutorial-images/tutorial-4.png" alt="Tutorial 4" className="w-full"/>
                                    </div>
                                </div>
                            );
                        case 5:
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
                                        <img src="/tutorial-images/tutorial-5.png" alt="Tutorial 5" className="w-full"/>
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
                    {pageNumber}/5
                </div>
                {pageNumber < 5 ? (
                    <Button 
                        className={`${buttonVariants.confirm} px-2`} 
                        variant="outline" 
                        onClick={() => setPageNumber(pageNumber + 1)} 
                        disabled={pageNumber >= 5}
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