import { useState } from "react";
import { buttonVariants } from '@/lib/config.ts';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';


const Tutorial = () => {
    const [pageNumber, setPageNumber] = useState<number>(1);
    return (
        <div className='p-6 flex flex-col h-full'>
            <div>
                <h2 className="text-lg font-semibold mb-2">Welcome to IMF Editor</h2>
                {pageNumber === 1 && (
                    <div className="flex flex-row flex-between gap-4 ">
                        <p className='mb-4 w-1/2'>
                            IMF Editor is a tool for designing within the
                            <a className="text-blue-500 hover:underline" href="https://sirius-labs.no/imf/" title="sirius-labs.no/imf"> Information Modelling Framework (IMF).</a>
                             <br/>
                             The editor allows you to create and edit elements, and connect them with relations.
                             <br/><br/>
                             To create a new element, you can drag an element from the left sidebar onto the middle canvas.
                        </p>
                        <div className="w-1/2 border-2 border-black">
                            <img src="/tutorial-images/tutorial-1.png" alt="Tutorial 1" className="w-fullborder-4 border-black"/>
                        </div>
                    </div>
                )}
                {pageNumber === 2 && (
                    <div>
                        <p className='mb-4'>To create a new node, click on the "Add Node" button in the toolbar. You can then drag the node to the desired location on the canvas.</p>
                    </div>
                )}
            </div>

            <div className="align-bottom flex justify-center mt-auto mb-14">
                <Button 
                    className={`${buttonVariants.confirm} px-2`} 
                    variant="outline" 
                    onClick={() => setPageNumber(pageNumber - 1)} 
                    disabled={pageNumber <= 1}
                >
                    <ChevronLeft />
                </Button>
                <div className="w-14 p-2 font-semibold text-center">
                    {pageNumber}/6
                </div>
                <Button 
                    className={`${buttonVariants.confirm} px-2`} 
                    variant="outline" 
                    onClick={() => setPageNumber(pageNumber + 1)} 
                    disabled={pageNumber >= 6}
                >
                    <ChevronRight />
                </Button>
            </div>
          
        </div>
    )
}
export default Tutorial;