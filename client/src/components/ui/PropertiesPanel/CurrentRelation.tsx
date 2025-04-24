import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '../Misc/select';
import { updateEdge } from '@/api/edges';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { EdgeType } from '@/lib/types';
import { useStore } from '@/hooks';
import { Trash2 } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';

interface CurrentRelationProps {
  currentRelation: any;
}

const CurrentRelation: React.FC<CurrentRelationProps> = ({ currentRelation }) => {
  const { nodes } = useStore();
  const sourceNode = nodes.find((node: any) => node.id === currentRelation.source);
  const targetNode = nodes.find((node: any) => node.id === currentRelation.target);
  const { handleTriggerDelete } = useClipboard();

  const handleConnectionTypeChange = async (newEdgeType: EdgeType) => {
    const updatedEdge = await updateEdge(currentRelation.id, newEdgeType);
    if (updatedEdge) {
      await updateNodeConnectionData(
        currentRelation.source,
        currentRelation.target,
        currentRelation.type,
        newEdgeType
      );
      currentRelation.type = newEdgeType;
    }
  };

  return (
    <div className="">
      <div className="mb-2 p-4 flex flex-col gap-2 items-start border-b border-[#9facbc]">
        <div className="flex items-center gap-2">
          <strong>Edge from:</strong>
          <div className="ml-2 text-black-600 break-all whitespace-normal">
            {sourceNode ? sourceNode.data.customName || sourceNode.data.label : currentRelation.source}
          </div>
          <button onClick={handleTriggerDelete} title="Delete Relation" className="flex items-center">
            <Trash2 size={18} className="text-red-700" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <strong>To:</strong>
          <div className="ml-2 text-black-600 break-all whitespace-normal">
            {targetNode ? targetNode.data.customName || targetNode.data.label : currentRelation.target}
          </div>
        </div>
      </div>

      <div className="mb-4 px-4 pb-4 border-b border-[#9facbc]">
        <strong>Relation Type:</strong>
        <div className="mb-2"></div>
        <Select 
          value={currentRelation.type} 
          onValueChange={(value) => handleConnectionTypeChange(value as EdgeType)}
        >
          <SelectTrigger className="w-[180px] p-3">
            <SelectValue>
              {(() => {
              switch (currentRelation.type) {
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
                return currentRelation.type;
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
    </div>
  );
};

export default CurrentRelation;