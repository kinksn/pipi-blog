import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { GetPostSelectTags, UpdatePostBodySchema } from "@/app/api/post/model";

type ContextProps = {
  params: {
    postId: string;
  };
};

export async function DELETE(req: Request, context: ContextProps) {
  try {
    const session = await getAuthSession();
    const { params } = context;
    const input = await req.json();

    if (session?.user?.id !== input.userId) {
      return NextResponse.json(
        { message: "not allowed to delete post" },
        { status: 403 }
      );
    }

    await db.post.delete({
      where: {
        id: params.postId,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: `could not delete post: ${error}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: ContextProps) {
  try {
    const session = await getAuthSession();
    const { params } = context;
    const body = UpdatePostBodySchema.parse(await req.json());

    if (session?.user?.id !== body.userId) {
      return NextResponse.json(
        { message: "not allowed to update post" },
        { status: 403 }
      );
    }

    // タグIDを取得
    // Tag[]が渡された場合でもIDのみを抽出
    const tagIds = body.tags.map((tag) =>
      typeof tag === "string" ? tag : tag.id
    );

    // タグの更新（中間テーブル`PostTag`を利用）
    await db.post.update({
      where: {
        id: params.postId,
      },
      data: {
        title: body.title,
        content: body.content,
        tags: {
          deleteMany: {}, // 既存のタグを一度削除
          create: tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId }, // タグのIDだけをconnectで指定
            },
          })),
        },
      },
    });

    return NextResponse.json({ message: "update success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `could not update post: ${error}` },
      { status: 500 }
    );
  }
}

export async function GET(_req: Request, context: ContextProps) {
  try {
    const { params } = context;
    const post: GetPostSelectTags = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedPost = {
      ...post,
      tags:
        post?.tags?.map((tagRelation) => ({
          id: tagRelation.tag.id,
          name: tagRelation.tag.name,
        })) || [],
    };

    return NextResponse.json(formattedPost, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `could not get post: ${error}` },
      { status: 500 }
    );
  }
}