"use client";

import { default as PostTag } from "@/components/Tag";
import { Tag } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { FC } from "react";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    content: string;
    image?: string;
    tag?: Tag;
  };
};

const PostCard: FC<PostCardProps> = ({ post }) => {
  const { id, title, content, image, tag } = post;

  return (
    <div className="card w-full bg-base-100 shadow-xl border">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {image && <Image src={image} alt="" width="100" height="100" />}
        <p>{content.slice(0, 60)}</p>
        <div className="card-actions justify-end">
          {tag && <PostTag tag={tag} />}
          <div className="card-actions justify-end">
            <Link href={`/blog/${id}`} className="hover:underline">
              Read more...
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
