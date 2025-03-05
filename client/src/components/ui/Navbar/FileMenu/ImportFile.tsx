import { Button } from '../../button';
import { buttonVariants } from '@/lib/config.ts';
import { z } from 'zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateJsonFiles } from '@/lib/utils/validators';
import { useSession } from '@/hooks';
import { toast } from 'react-toastify';
import { uploadNodes } from '@/api/nodes';
import { uploadEdges } from '@/api/edges';
import { generateNewNodeId } from '@/lib/utils';
import { Edge, Node } from 'reactflow';

  
  // Updated schema to expect only one .imf file
  const filesSchema = z.object({
    files: z
      .array(z.instanceof(File))
      .min(1, { message: 'One .imf file is required' })
      .max(1, { message: 'Only one .imf file is allowed' }),
  });

  interface ImportFileProps {
    close: () => void;
  }
  
  const ImportFile: React.FC<ImportFileProps> = ({close}) => {
    const { user } = useSession();
  
    const {
      control,
      handleSubmit,
      setError,
      clearErrors,
      formState: { errors },
    } = useForm<{ files: File[] }>({
      resolver: zodResolver(filesSchema),
    });
  
    const onSubmit: SubmitHandler<{ files: File[] }> = async (
      data: z.infer<typeof filesSchema>
    ) => {
      const errorMessage = await validateJsonFiles(data.files);
      if (errorMessage) {
        setError('files', { type: 'manual', message: errorMessage });
        return;
      }
  
      clearErrors('files');
  
      const dataToUpload: { nodes: Node[]; edges: Edge[] } = {
        nodes: [],
        edges: [],
      };
  
      try {
        const file = data.files[0]; // Only one file is expected
        const fileContent = await file.text();
        const imfData = JSON.parse(fileContent);
  
        // Validate the structure of the .imf file
        if (!imfData.nodes || !imfData.edges) {
          setError('files', {
            type: 'manual',
            message: 'Invalid .imf file structure - missing nodes or edges arrays',
          });
          return;
        }
  
        dataToUpload.nodes = imfData.nodes;
        dataToUpload.edges = imfData.edges;
  
        const idsToReplace: Record<string, string> = {};
  
        // Make sure node data is updated with new data
        for (const node of dataToUpload.nodes) {
          const currentDate = Date.now();
          node.data.createdBy = user?.id;
          node.data.createdAt = currentDate;
          node.data.updatedAt = currentDate;
  
          const connectedEdges = dataToUpload.edges.filter(edge =>
            edge.id.includes(node.id)
          );
  
          const newNodeId = generateNewNodeId(node.id);
          idsToReplace[node.id] = newNodeId;
  
          // Make sure all edges with relation to old node ids are updated with new ones
          for (const edge of connectedEdges) {
            edge.id = edge.id.replace(node.id, newNodeId);
            edge.data.createdBy = user?.id;
            edge.data.createdAt = currentDate;
            edge.data.updatedAt = currentDate;
            if (edge.source === node.id) {
              edge.source = newNodeId;
            } else {
              edge.target = newNodeId;
            }
          }
          node.id = newNodeId;
        }
  
        // Make sure all nodes with relation to old node ids are updated with new ones
        for (const node of dataToUpload.nodes) {
          for (const key in node.data) {
            if (typeof node.data[key] === 'string') {
              if (Object.keys(idsToReplace).includes(node.data[key])) {
                node.data[key] = idsToReplace[node.data[key]];
              }
            }
  
            if (Array.isArray(node.data[key])) {
              node.data[key] = node.data[key].map((value: { id: string }) => {
                if (Object.keys(idsToReplace).includes(value.id)) {
                  value.id = idsToReplace[value.id];
                }
                return value;
              });
            }
          }
        }
  
        
        const uploadedNodes = await uploadNodes(dataToUpload.nodes);
        const uploadedEdges = await uploadEdges(dataToUpload.edges);
        if (uploadedNodes && uploadedEdges) {
            close();
            toast.success('File uploaded successfully!');
        }
      } catch (error) {
        toast.error('There was an error processing the file');
      }
    };
  
    return (
      <div className='p-4'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex justify-center'>
              <Controller
              name="files"
              control={control}
              defaultValue={[]}
                render={({ field: { onChange, onBlur } }) => (
                  <input
                    className='w-full border border-[#9facbc] p-2 rounded-lg'
                    type="file"
                    onBlur={onBlur}
                    onChange={e => onChange([...e.target.files!])}
                    accept=".imf"
                    required
                  />
                )}
              />
            </div>
            {errors.files && (
              <p className="my-2 text-red-500">{errors.files.message}</p>
            )}
              <div className="flex justify-center mt-4 gap-4">
                <Button
                  className={`w-1/4 ${buttonVariants.cancel}`}
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button type="submit" className={`w-1/4 ${buttonVariants.confirm}`}>
                  Import
                </Button>
              </div>
          </form>
      </div>
    );
  };

export default ImportFile;