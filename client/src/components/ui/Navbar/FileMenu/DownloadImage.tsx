import { useReactFlow, getNodesBounds, getViewportForBounds } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import { useTheme } from '@/hooks';
import { Button } from '@/components/ui/Misc/button';
import { buttonVariants } from '@/lib/config.ts';
import { useEffect } from 'react';

interface DownloadImageProps {
    fileName: string;
    fileType?: 'png' | 'svg';
}

const Download = (dataUrl: string, fileName: string ) => {
    const a = document.createElement('a');

    a.setAttribute('download', fileName);
    a.setAttribute('href', dataUrl);
    a.click();
};

const DownloadImage = ({ fileName, fileType }: DownloadImageProps) => {

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && (fileType === 'png' || fileType === 'svg')) {
                onClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [fileType]);


    const { getNodes } = useReactFlow();
    const { theme } = useTheme();

    const onClick = () => {
        const nodes = getNodes();
        const nodesBounds = getNodesBounds(nodes);

        // Calculate image dimensions based on node layout
        const padding = 50; 
        const imageWidth = nodesBounds.width + padding * 2;
        const imageHeight = nodesBounds.height + padding * 2;

        const viewport = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.1,  // min zoom
            2     // max zoom
        );

        const element = document.querySelector('.react-flow__viewport');
        if (element instanceof HTMLElement && fileType === 'png') {
            toPng(element, {
                backgroundColor: theme === 'dark' ? '#232528' : '#ffffff',
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            }).then((dataUrl) => Download(dataUrl, fileName));
        }
        else if (element instanceof HTMLElement && fileType === 'svg') {
            toSvg(element, {
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            }).then((dataUrl) => Download(dataUrl, fileName));
        }
    };

    return <Button className={`w-1/4 ${buttonVariants.confirm}`} onClick={onClick}>Export</Button>;
}

export default DownloadImage;