import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Input } from '../input';
import { Button } from '../button';
import { Select, 
    SelectTrigger, 
    SelectValue, 
    SelectContent, 
    SelectGroup, 
    SelectItem 
} from '../select';
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormMessage 
} from '../form';
import { Trash, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
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
import { updateNode, deleteNode } from '@/api/nodes';
import {
    AspectType, 
    CustomAttribute, 
    Provenance, Scope, 
    Range, 
    Regularity 
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface CurrentNodeProps {
  currentNode: any;
}

const customAttributeSchema = z.object({
  name: z.string().min(1).max(25),
  value: z.string().min(1).max(25),
  unitOfMeasure: z.string().optional(),
  quantityDatums: z.object({
    provenance: z.enum(['specified', 'calculated', 'measured']).optional(),
    scope: z.enum(['design', 'operating']).optional(),
    range: z.enum(['nominal', 'normal', 'average', 'minimum', 'maximum']).optional(),
    regularity: z.enum(['continuous', 'absolute']).optional(),
  }).optional(),
});

const CurrentNode: React.FC<CurrentNodeProps> = ({ currentNode }) => {
  const [label, setLabel] = useState(currentNode.data.label || '');
  const [editLabel, setEditLabel] = useState(false);
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(currentNode.data.customAttributes || []);

  const form = useForm<z.infer<typeof customAttributeSchema>>({
    resolver: zodResolver(customAttributeSchema),
    defaultValues: {
      name: '',
      value: '',
      unitOfMeasure: '',
      quantityDatums: {
        provenance: undefined,
        scope: undefined,
        range: undefined,
        regularity: undefined,
      },
    },
  });

  useEffect(() => {
    setLabel(currentNode.data.label || '');
    setCustomAttributes(currentNode.data.customAttributes || []);
  }, [currentNode]);

  const handleUpdateLabel = async () => {
    const updated = await updateNode(currentNode.id, { label });
    if (updated) {
      currentNode.data.label = label;
    }
    setEditLabel(false);
  };

  const addCustomAttribute = async (values: z.infer<typeof customAttributeSchema>) => {
    const newAttributes = [
      ...currentNode.data.customAttributes,
      {
        name: values.name,
        value: values.value,
        unitOfMeasure: values.unitOfMeasure || '',
        quantityDatums: {
          provenance: values.quantityDatums?.provenance as Provenance,
          scope: values.quantityDatums?.scope as Scope,
          range: values.quantityDatums?.range as Range,
          regularity: values.quantityDatums?.regularity as Regularity,
        },
      },
    ];
    const updated = await updateNode(currentNode.id, { customAttributes: newAttributes });
    if (updated) {
      currentNode.data.customAttributes = newAttributes;
      setCustomAttributes(newAttributes);
      form.reset();
      toast.success('Attribute added');
    }
  };

  const handleDeleteAttribute = async (attr: CustomAttribute) => {
    const updatedAttributes = customAttributes.filter(a => a !== attr);
    setCustomAttributes(updatedAttributes);
    const updated = await updateNode(currentNode.id, { customAttributes: updatedAttributes });
    if (updated) {
      currentNode.data.customAttributes = updatedAttributes;
      toast.success('Attribute deleted');
    }
  };

  const handleDeleteNode = async () => {
    const deleted = await deleteNode(currentNode.id);
    if (deleted) {
      toast.success('Node deleted');
    }
  };

  const handleAspectChange = async (newAspect: AspectType) => {
    const updated = await updateNode(currentNode.id, { aspect: newAspect });
    if (updated) {
      currentNode.data.aspect = newAspect;
      toast.success('Aspect updated');
    }
  };

  const [isAttributesVisible, setIsAttributesVisible] = useState(false);

  const toogleAttributes = () => {
    setIsAttributesVisible(!isAttributesVisible);
  };

  return (
    <div>
      <div className="mb-2">
        <strong>Name:</strong>{' '}
        {editLabel ? (
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleUpdateLabel}
            autoFocus
          />
        ) : (
          <span onClick={() => setEditLabel(true)} className="cursor-pointer">
            {label || 'N/A'} <Edit2 size={18} className="inline ml-1" />
          </span>
        )}
      </div>
      <div className="mb-4">
        <strong>Aspect type:</strong>
        <Select value={currentNode.data.aspect} onValueChange={handleAspectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>{currentNode.data.aspect || 'Select aspect'}</SelectValue>
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
      </div>
      <div className="mb-4">
        <Form {...form}>
          <form className="my-4" onSubmit={form.handleSubmit(addCustomAttribute)}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-black dark:text-white"><strong>Custom attributes:</strong></p>
              {isAttributesVisible ?
                <ChevronUp onClick={() => setIsAttributesVisible(false)} className="text-black dark:text-white size-5 hover:cursor-pointer" /> :
                <ChevronDown onClick={() => setIsAttributesVisible(true)} className="text-black dark:text-white size-5 hover:cursor-pointer" />
              }
            </div>
            {isAttributesVisible && (
              <div className="form-select w-full text-black dark:text-white px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                <p className="text-sm text-muted-foreground mb-3">Create Custom attributes</p>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormControl>
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Name"
                            maxLength={25}
                            className={cn('my-2 mr-2 flex-1', {
                              'border-red-500': form.formState.errors.value,
                            })}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormControl>
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Value"
                            maxLength={25}
                            className={cn('my-2', {
                              'border-red-500': form.formState.errors.value,
                            })}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitOfMeasure"
                  render={({ field }) => (
                    <FormControl>
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Unit"
                            maxLength={25}
                            className="my-2"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </FormControl>
                  )}
                />
                {/* New: Quantity Datums Section */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-3">Quantity Datums</p>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Provenance */}
                    <FormField
                      control={form.control}
                      name="quantityDatums.provenance"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Provenance" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="specified">Specified</SelectItem>
                                  <SelectItem value="calculated">Calculated</SelectItem>
                                  <SelectItem value="measured">Measured</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Scope */}
                    <FormField
                      control={form.control}
                      name="quantityDatums.scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Scope" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="design">Design</SelectItem>
                                  <SelectItem value="operating">Operating</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Range */}
                    <FormField
                      control={form.control}
                      name="quantityDatums.range"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="nominal">Nominal</SelectItem>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="average">Average</SelectItem>
                                  <SelectItem value="minimum">Minimum</SelectItem>
                                  <SelectItem value="maximum">Maximum</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Regularity */}
                    <FormField
                      control={form.control}
                      name="quantityDatums.regularity"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Regularity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="continuous">Continuous</SelectItem>
                                  <SelectItem value="absolute">Absolute</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* End of Quantity Datums Section */}
                <Button type="submit" className="w-full my-2 bg-blue-500 hover:bg-blue-700 text-white" size="sm">
                  Add
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
      {customAttributes.map((attr, index) => (
        <div key={index} className="flex items-center justify-between p-2 border mb-1">
          <span className="text-sm">
            {attr.name}: {attr.value} {attr.unitOfMeasure && `(${attr.unitOfMeasure})`}
          </span>
          <Trash
            size={16}
            onClick={() => handleDeleteAttribute(attr)}
            className="cursor-pointer text-red-500"
          />
        </div>
      ))}
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
            <AlertDialogTitle>Are you sure you want to delete this node?</AlertDialogTitle>
            <AlertDialogDescription>
            Any edges or references to this node will be deleted. You can undo this action if needed.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNode}>
            Delete
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurrentNode;
