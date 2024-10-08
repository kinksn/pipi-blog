"use client";

import BackButton from "@/components/BackButton";
import { PostTag } from "@/components/Tag";
import { useGetTags, useCreateTag } from "@/hooks/useTags";
import { Tag } from "@prisma/client";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

const CreateTag = () => {
  const { data: tags, isLoading: isLoadingGetTags } = useGetTags();
  const { mutate: tagCreate } = useCreateTag();
  const { data: session } = useSession();
  const { register, handleSubmit, reset } = useForm<Pick<Tag, "name">>();

  return (
    <>
      <BackButton />
      <div className="max-w-lg mx-auto">
        <h1 className="te t-2xl my-4 font-bold text-center">Add new tag</h1>
        <form
          onSubmit={handleSubmit((data: Pick<Tag, "name">) => {
            tagCreate(data);
            reset();
          })}
          className="flex items-center justify-center gap-2 mt-10"
        >
          <input
            type="text"
            {...register("name", { required: true })}
            placeholder="tag name..."
            className="input input-bordered w-full"
          />
          <button
            type="submit"
            className="btn bg-yellow-400 hover:bg-yellow-500 border-0 text-gray-900"
          >
            <Plus />
          </button>
        </form>
        <div className="flex gap-2 mt-4 w-full flex-wrap">
          {isLoadingGetTags && (
            <span className="loading loading-dots loading-md block mx-auto"></span>
          )}
          {tags?.map((tag) => (
            <PostTag tag={tag} key={tag.id} session={session} />
          ))}
        </div>
      </div>
    </>
  );
};

export default CreateTag;
