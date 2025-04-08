import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '../select';
import { updateEdge } from '@/api/edges';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { EdgeType } from '@/lib/types';
import { useStore } from '@/hooks';
import { Trash2 } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';

interface CurrentEdgeProps {
  currentEdge: any;
}

const CurrentEdge: React.FC<CurrentEdgeProps> = ({ currentEdge }) => {
  const { nodes, setEdges} = useStore();
  const sourceNode = nodes.find((node: any) => node.id === currentEdge.source);
  const targetNode = nodes.find((node: any) => node.id === currentEdge.target);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleTriggerDelete } = useClipboard();

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

  const handleDeleteClick = async () => {
    const currentEdges = useStore.getState().edges;
    setEdges(
      currentEdges.map(e => (e.id === currentEdge.id ? { ...e, selected: true } : e))
    );
    await handleTriggerDelete();
  };

  return (
    <div className="">
      <div className="mb-2 p-4 flex flex-col gap-2 items-start border-b border-[#9facbc]">
        <div className="flex items-center gap-2">
          <strong>Edge from:</strong>
          <div className="ml-2 text-black-600">
            {sourceNode ? sourceNode.data.customName || sourceNode.data.label : currentEdge.source}
          </div>
          <button onClick={handleDeleteClick} title="Delete Relation" className="flex items-center">
            <Trash2 size={18} className="text-red-700" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <strong>To:</strong>
          <div className="ml-2 text-black-600 flex-grow">
            {targetNode ? targetNode.data.customName || targetNode.data.label : currentEdge.target}
          </div>
        </div>
      </div>

      <div className="mb-4 px-4 pb-4 border-b border-[#9facbc]">
        <strong>Relation Type:</strong>
        <div className="mb-2"></div>
        <Select 
          value={currentEdge.type} 
          onValueChange={(value) => handleConnectionTypeChange(value as EdgeType)}
        >
          <SelectTrigger className="w-[180px] p-3">
            <SelectValue>
              {(() => {
              switch (currentEdge.type) {
                case EdgeType.Connected:
                return 'Connected to';
                case EdgeType.Transfer:
                return 'Transferred to';
                case EdgeType.Part:
                return 'Part of';
                case EdgeType.Specialization:
                return 'Specialization';
                case EdgeType.Fulfilled:
                return 'Fulfills';
                case EdgeType.Proxy:
                return 'Proxy';
                case EdgeType.Projection:
                return 'Projection';
                case EdgeType.Equality:
                return 'Same as';
                default:
                return currentEdge.type;
              }
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={EdgeType.Connected}>Connected to</SelectItem>
              <SelectItem value={EdgeType.Transfer}>Transferred to</SelectItem>
              <SelectItem value={EdgeType.Part}>Part of</SelectItem>
              <SelectItem value={EdgeType.Specialization}>Specialization</SelectItem>
              <SelectItem value={EdgeType.Fulfilled}>Fulfills</SelectItem>
              <SelectItem value={EdgeType.Proxy}>Proxy</SelectItem>
              <SelectItem value={EdgeType.Projection}>Projection</SelectItem>
              <SelectItem value={EdgeType.Equality}>Same as</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        elementType="relation"
        onConfirm={handleDeleteClick}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default CurrentEdge;
