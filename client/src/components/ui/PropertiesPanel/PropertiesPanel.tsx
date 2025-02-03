import { deleteNode, updateNode } from '@/api/nodes';
import { Trash, Plus, Edit2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Node, Edge } from 'reactflow';
import Modal from '@/components/ui/Modal';
import { GlobalHotKeys } from 'react-hotkeys';
import {
  AspectType,
  type CustomNodeProps,
  RelationType,
  CustomAttribute,
  Provenance,
  Scope,
  Range,
  Regularity
} from '@/lib/types';
import {
  capitalizeFirstLetter,
  getReadableRelation,
  displayNode,
  cn
} from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem, 
} from '../select';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'; 
// import { Button } from '../button';
// import { buttonVariants } from '@/lib/config';

interface PropertiesPanelProps {
  selectedElement: Node | Edge | null; // Accept either a Node or an Edge
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {

  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);
  const { register, handleSubmit, reset } = useForm<CustomAttribute>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLabel, setEditLabel] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (selectedElement && 'data' in selectedElement) {
      setLabel(selectedElement.data.label || '');
      setCustomAttributes(selectedElement.data.customAttributes || []);
    } else {
      setLabel('');
    }
  }, [selectedElement]);


  const handleDeleteAttribute = async (attr: CustomAttribute) => {
    const updatedAttributes = customAttributes.filter(a => a !== attr);
    setCustomAttributes(updatedAttributes);

    if (selectedElement && 'data' in selectedElement) {
      await updateNode(selectedElement.id, { customAttributes: updatedAttributes });
    }
  }
  
  const keyMap = {
    DELETE_NODE: ['del', 'backspace'],
  };

  const handlers = {
    DELETE_NODE: (event?: KeyboardEvent) => {
      if (!event) return;
  
      const tag = (event.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }
  
      if (selectedElement) {
        event.preventDefault();
        setIsModalOpen(true);
      }
      else {
        return;
      }
    },
  };

  const handleAspectChange = async (newAspectType: AspectType) => {
      if (selectedElement) {
        const updated = await updateNode(selectedElement.id, {
        aspect: newAspectType,
      });
      if (updated) {
        selectedElement.data.aspect = newAspectType;
      };
    };
  };

  // Used for the AlertDialog component
  // const handleDelete = async () => {
  //   if (selectedElement) {
  //     await deleteNode(selectedElement.id);
  //     setIsModalOpen(false);
  //   }
  // };

  // Used for the Modal component
  const handleDeleteElement = async () => {
    if (selectedElement) {
      await deleteNode(selectedElement.id);
      setIsModalOpen(false);
    }
  };

  const onSubmit = async (data: CustomAttribute) => {
    const newAttributes = [...customAttributes, data];
    setCustomAttributes(newAttributes);

    if (selectedElement && 'data' in selectedElement) {
      await updateNode(selectedElement.id, { customAttributes: newAttributes });
      reset();
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleUpdateLabel = async () => {
    if (selectedElement && 'data' in selectedElement) {
      console.log('Updating label for:', selectedElement.id, 'New label:', label);
      const updated = await updateNode(selectedElement.id, { label });
      console.log('Label update successful:', updated);
      if (updated) {
        selectedElement.data.label = label;
      }
      setEditLabel(false);
    }
  };

  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges>
      <div className="h-full w-56 text-black border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10">
        <div className="p-4 mt-14 mb-2 border-b border-[#9facbc]">
          <h2 className="text-lg text-black dark:text-white font-semibold">Properties</h2>
        </div>
        <div className="p-4 overflow-auto">
          {selectedElement ? (
            <>
              {/* <p className="mb-2 text-black dark:text-white">
                <strong>ID:</strong> {selectedElement.id}
              </p> */}
              {'data' in selectedElement && (
                  <>
                    <div className="mb-2 text-black dark:text-white">
                      <strong>Name:</strong>
                      {editLabel ? (
                        <input
                          type="text"
                          value={label}
                          onChange={handleLabelChange}
                          onBlur={handleUpdateLabel}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => setEditLabel(true)} className="ml-2 cursor-pointer flex items-center text-black dark:text-white boder-b black ">
                            {label || 'N/A'}
                          <Edit2 size={18} className="ml-1 text-black-500 hover:text-black-700"/>
                      </span>
                      )}
                    </div>
                  <p className="mb-2 text-black dark:text-white">
                    <strong>Aspect type:</strong>
                  </p>
                  <Select
                    value={selectedElement.data.aspect}
                    onValueChange={handleAspectChange}
                  >
                    <SelectTrigger className="w-[180px] text-black dark:text-white">
                      <SelectValue>{selectedElement.data.aspect || 'Select aspect'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={AspectType.Function}>Function</SelectItem>
                        <SelectItem value={AspectType.Product}>Product</SelectItem>
                        <SelectItem value={AspectType.Location}>Location</SelectItem>
                        <SelectItem value={AspectType.Installed}>Installed</SelectItem>
                        <SelectItem value={AspectType.NoAspect}>No Aspect</SelectItem>
                        <SelectItem value={AspectType.UnspecifiedAspect}>Unspecified Aspect</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                    {/* Added an extra space between the dropdown menu and custom attributes */}
                    <div className="mb-4"></div>
                  <p className="mb-2 text-black dark:text-white">
                    <strong></strong>
                  </p>
                  {/* <p className="mb-2 text-black dark:text-white">
                    <strong>Created:</strong> {new Date(selectedElement.data.createdAt).toLocaleString()}
                  </p> */}
                  {/* <p className="mb-2 text-black dark:text-white">
                    <strong>Updated:</strong> {new Date(selectedElement.data.updatedAt).toLocaleString()}
                  </p> */}
                  {/*
                    {'position' in selectedElement && (
                      <p className="mb-2 text-black dark:text-white">
                      <strong>Position:</strong> ({selectedElement.position.x.toFixed(2)}, {selectedElement.position.y.toFixed(2)})
                      </p>
                    )}
                  )} */}
                  <p className="mb-2 text-black dark:text-white"><strong>Custom Attributes:</strong></p>
                  <form onSubmit={handleSubmit(onSubmit)} className="my-2">
                    <div className="flex flex-col gap-1 mb-1">
                      <input {...register('name')} placeholder="Name" className="border p-1 text-sm" required />
                      <input {...register('value')} placeholder="Value" className="border p-1 text-sm" required />
                      <input {...register('unitOfMeasure')} placeholder="Unit of Measure" className="border p-1 text-sm" />
                      <button type="submit" className="bg-blue-500 hover:bg-blue-700 p-1 text-sm rounded font-bold text-white dark:text-white">Add</button>
                    </div>
                  </form>
                  {customAttributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center mb-1 text-black dark:text-white">
                    <span className="text-sm w-40 break-words">{attr.name}: {attr.value}: {attr.unitOfMeasure}</span>
                    <Trash size={16} onClick={() => handleDeleteAttribute(attr)} className="cursor-pointer text-red-500"/>
                    </div>
                  ))}

                    <button onClick={() => setIsModalOpen(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 
                    rounded hover:bg-red-700 justify-center w-full mt-16">
                      Delete Node
                    </button>
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDelete={handleDeleteElement}>
                        <div className='text-center text-black dark:text-black font-semibold text-xl p-4'>
                          Confirm Deletion
                        </div>
                      <div className='text-center text-black dark:text-black'>
                          Are you sure you want to delete this node? <br/>
                          Any edges or references to this node will be deleted. <br/>
                          This action cannot be undone.
                      </div>
                    </Modal>
                    {/* <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className={`${buttonVariants.danger} mt-10 w-full justify-center`}
                          variant="outline"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this node?</AlertDialogTitle>
                          <AlertDialogDescription>
                          Any edges or references to this node will be deleted. You can undo this action if needed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                </>
              )}
            </>
          ) : (
            <p>No element selected</p>
          )}
        </div>
      </div>
    </GlobalHotKeys>
  );
};

export default PropertiesPanel;



