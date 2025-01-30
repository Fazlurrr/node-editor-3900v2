import toast from 'react-hot-toast';
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
import { getNodeRelations } from '@/lib/utils/nodes';
import { FC, useState } from 'react';
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../sheet';
import { Trash } from 'lucide-react';
import { useDebounce, useSidebar, useStore } from '@/hooks';
import { Input } from '../input';
import { Button } from '../button';
import { buttonVariants } from '@/lib/config';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
} from '../select';
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
import { ScrollArea } from '../scroll-area';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../form';

interface Props {
  currentNode: CustomNodeProps;
}
const customAttributeSchema = z.object({
  name: z.string().min(1).max(25),
  value: z.string().min(1).max(25),
  unitOfMeasure: z.string().optional(),
  enumeratedTypes: z.object({
    provenance: z.enum(['specified', 'calculated', 'measured']).optional(),
    scope: z.enum(['design', 'operating']).optional(),
    range: z.enum(['nominal', 'normal', 'average', 'minimum', 'maximum']).optional(),
    regularity: z.enum(['continuous', 'absolute']).optional(),
  }).optional(),
});


const CurrentNode: FC<Props> = ({ currentNode }) => {
  const displayName = capitalizeFirstLetter(
    currentNode?.data?.customName
      ? currentNode?.data?.customName
      : currentNode?.data?.label
  );

  const { closeSidebar, openSidebar } = useSidebar();
  const { nodes } = useStore();

  const nodeRelations = getNodeRelations(currentNode);
  const hasNodeRelations = nodeRelations.some(
    nodeRelation => nodeRelation.children.length > 0
  );

  const addCustomAttribute = async (
    values: z.infer<typeof customAttributeSchema>
  ) => {
    const newAttributes = [
      ...currentNode.data.customAttributes,
      {
        name: values.name,
        value: values.value,
        unitOfMeasure: values.unitOfMeasure || '',
        enumeratedTypes: {
          provenance: values.enumeratedTypes?.provenance as Provenance,
          scope: values.enumeratedTypes?.scope as Scope,
          range: values.enumeratedTypes?.range as Range,
          regularity: values.enumeratedTypes?.regularity as Regularity,
        },
      },
    ];
    const updated = await updateNode(currentNode.id, {
      customAttributes: newAttributes,
    });
  
    if (updated) {
      currentNode.data.customAttributes = newAttributes;
      closeSidebar();
      setTimeout(() => {
        openSidebar(currentNode);
      }, 300);
      form.reset();
    }
  };
  

  const handleAspectChange = async (newAspectType: AspectType) => {
    const updated = await updateNode(currentNode.id, {
      aspect: newAspectType,
    });
    if (updated) {
      currentNode.data.aspect = newAspectType;
      closeSidebar();
      setTimeout(() => {
        openSidebar(currentNode);
      }, 300);
    }
  };

  const deleteCustomAttribute = async ({ name, value }: CustomAttribute) => {
    const newAttributes = currentNode.data.customAttributes.filter(
      attr => attr.name !== name && attr.value !== value
    );

    const updated = await updateNode(currentNode.id, {
      customAttributes: newAttributes,
    });
    if (updated) {
      currentNode.data.customAttributes = newAttributes;
      closeSidebar();
      setTimeout(() => {
        openSidebar(currentNode);
      }, 300);
    }
  };

  const handleDelete = async () => {
    const deleted = await deleteNode(currentNode.id as string);

    if (deleted) {
      closeSidebar();
    }
  };

  const form = useForm<z.infer<typeof customAttributeSchema>>({
    resolver: zodResolver(customAttributeSchema),
    defaultValues: {
      name: '',
      value: '',
      unitOfMeasure: '',
      enumeratedTypes: {
        provenance: undefined,
        scope: undefined,
        range: undefined,
        regularity: undefined,
      },
    },
  });

  const { register, watch, setValue } = useForm<{ nodeName: string }>({
    defaultValues: {
      nodeName: displayName,
    },
  });
  const nodeName = watch('nodeName');

  const focusNodeName = () => {
    setTimeout(() => {
      const input = document.querySelector(
        'input[name="nodeName"]'
      ) as HTMLInputElement;
      input?.focus();
    }, 100);
  };

  const debouncedHandleChange = useDebounce(async (value: string) => {
    if (value === '' || nodeName === value) return;
    const nodeWithSameName = nodes.some(node => node.data.customName === value);
    if (nodeWithSameName) {
      toast.error(`A node with the name "${value}" already exists`);
      return;
    }

    const updated = await updateNode(currentNode.id, {
      customName: value,
    });
    if (updated) {
      currentNode.data.customName = value;
      closeSidebar();
      setTimeout(() => {
        openSidebar(currentNode);
        focusNodeName();
      }, 300);
    }
  }, 1500);

  const [disabled, setDisabled] = useState<boolean>(true);
  setTimeout(() => {
    setDisabled(false);
  }, 1);

  return (
    <SheetContent className="bg:background z-40 flex flex-col justify-between">
      <SheetHeader>
        <SheetTitle className="flex items-center uppercase dark:text-white">
          <Input
            {...register('nodeName')}
            disabled={disabled}
            value={nodeName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setValue('nodeName', e.target.value);
              debouncedHandleChange(e.target.value);
            }}
            className="mr-4 text-lg font-semibold text-foreground"
          />
        </SheetTitle>
        <SheetDescription>
          Created:{' '}
          {new Date(currentNode.data?.createdAt as number).toLocaleString()}
        </SheetDescription>
        <SheetDescription>
          Updated:{' '}
          {new Date(currentNode.data?.updatedAt as number).toLocaleString()}
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="h-full">
        <div className="my-4">
          <p className="mb-2 text-sm text-muted-foreground">Aspect type</p>
          <Select
            value={currentNode.data.aspect}
            onValueChange={handleAspectChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={currentNode.data.aspect} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={AspectType.Function}>Function</SelectItem>
                <SelectItem value={AspectType.Product}>Product</SelectItem>
                <SelectItem value={AspectType.Location}>Location</SelectItem>
                <SelectItem value={AspectType.Installed}>Installed</SelectItem>
                <SelectItem value={AspectType.Empty}>Empty</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {hasNodeRelations && (
          <div className="my-8 ">
            {nodeRelations.map(nodeRelation => {
              if (nodeRelation.children?.length === 0) return null;

              return (
                <div key={nodeRelation.key}>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {getReadableRelation(nodeRelation.key as RelationType)}
                  </p>
                  {nodeRelation.children?.map(c => {
                    const node = nodes.find(node => node.id === c.id);

                    return (
                      <Button
                        key={`${nodeRelation.key}_${c.id}_link_button`}
                        variant="ghost"
                        onClick={() => displayNode(c.id as string)}
                      >
                        {node?.data?.customName === ''
                          ? node.data?.label
                          : node?.data.customName}
                      </Button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        <Form {...form}>
          <form
            className="my-4"
            onSubmit={form.handleSubmit(addCustomAttribute)}
          >
            <p className="text-sm text-muted-foreground">Custom attributes</p>
            <div className="flex items-start justify-center">
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
                          maxLength={25} // max length of 25 characters for name
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
                name="value" // This should be a single field name, but we'll handle unitOfMeasure separately
                render={({ field }) => (
                  <FormControl>
                    {/* Wrap inputs in a flex container */}
                    <div className="flex gap-2">
                      {/* Value Input */}
                      <FormItem className="flex-1">
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

                      {/* Unit of Measure Input */}
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...form.register('unitOfMeasure')}
                            placeholder="Unit"
                            maxLength={10}
                            className={cn('my-2', {
                              'border-red-500': form.formState.errors.unitOfMeasure,
                            })}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    </div>
                  </FormControl>
                )}
              />
              {/* New: Enumerated Types Section */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Enumerated Types</p>
              <div className="grid grid-cols-1 gap-4">
                {/* Provenance */}
                <FormField
                  control={form.control}
                  name="enumeratedTypes.provenance"
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
                  name="enumeratedTypes.scope"
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
                  name="enumeratedTypes.range"
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
                  name="enumeratedTypes.regularity"
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
            {/* End of Enumerated Types Section */}
              <Button type="submit" className="w-25 my-2" size="sm">
                Add
              </Button>
            </div>
            {currentNode.data.customAttributes.length > 0 && (
              <>
                {currentNode.data.customAttributes.map((attr, i) => (
                    <div
                    key={i}
                    className="my-2 flex items-center text-muted-foreground"
                    >
                    <Trash
                      onClick={() => deleteCustomAttribute(attr)}
                      size={16}
                      className="text-md mr-2 font-semibold hover:cursor-pointer hover:text-red-500"
                    />
                    <p className="text-sm ">
                      {attr.name}: {attr.value}
                    </p>
                    </div>
                ))}
              </>
            )}
          </form>
        </Form>
      </ScrollArea>
      <SheetFooter>
      <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className={buttonVariants.danger}
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
        </AlertDialog>
      </SheetFooter>
    </SheetContent>
  );
};

export default CurrentNode;