import { Button } from '../button';
import { 
    Select,
    SelectTrigger,
    SelectValue, 
    SelectContent, 
    SelectGroup, 
    SelectItem 
} from '../select';
import { deleteEdge, updateEdge } from '@/api/edges';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { EdgeType } from '@/lib/types';
import toast from 'react-hot-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog'; 

interface CurrentEdgeProps {
  currentEdge: any;
}

const CurrentEdge: React.FC<CurrentEdgeProps> = ({ currentEdge }) => {
  const handleConnectionTypeChange = async (newEdgeType: EdgeType) => {
    const updatedEdge = await updateEdge(currentEdge.id, newEdgeType);
    if (updatedEdge) {
      await updateNodeConnectionData(
        currentEdge.source,
        currentEdge.target,
        currentEdge.type,
        newEdgeType
      );
      currentEdge.type = newEdgeType;
    }
  };

  const handleDeleteEdge = async () => {
    const deleted = await deleteEdge(currentEdge.id);
    if (deleted) {
        toast.success('Edge deleted');
      }
  };

  return (
    <div>
    <div className="mb-2">
      <strong>Edge from</strong>
      <div>{currentEdge.source}</div>
      <strong>To</strong>
      <div>{currentEdge.target}</div>
    </div>
      <div className="mb-4">
        <strong>Connection Type:</strong>
        <Select value={currentEdge.type} onValueChange={(value) => handleConnectionTypeChange(value as EdgeType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>{currentEdge.type}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={EdgeType.Part}>Part of</SelectItem>
              <SelectItem value={EdgeType.Connected}>Connected to</SelectItem>
              <SelectItem value={EdgeType.Fulfilled}>Fulfilled by</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
        <Button
            className="mt-4 bg-red-500 text-white w-full"
            variant="outline"
        >
            Delete
        </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this Edge?</AlertDialogTitle>
            <AlertDialogDescription>
            You can undo this action if needed.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEdge}>
            Delete
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurrentEdge;
