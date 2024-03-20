import Post from "../../models/post.models.js";
import slugify from "slugify";
import jwt from "jsonwebtoken";

const postResolver = {
  Query: {
    allPosts: async () => {
      try {
        const posts = await Post.find().exec();
        return posts;
      } catch (error) {
        throw new Error(`Erro ao buscar todos os posts: ${error.message}`);
      }
    },
    onePost: async (_, { id }) => {
      try {
        const post = await Post.findById(id).exec();
        if (!post) {
          throw new Error("Post não encontrado.");
        }
        return post;
      } catch (error) {
        throw new Error(`Erro ao buscar o post: ${error.message}`);
      }
    },
  },

  Mutation: {
    createPost: async (_, { newPost }, { userId }) => {
      try {
        // Verificar se o usuário está autenticado
        if (!userId) {
          throw new Error(
            "Usuário não autenticado. Faça login para continuar."
          );
        }
        // Verificar se o título já está em uso
        const existingPost = await Post.findOne({ title: newPost.title });
        if (existingPost) {
          throw new Error("Já existe um post com este título.");
        }
        // Criar um slug único
        const slug = slugify(newPost.title, { lower: true });
        // Criar o novo post associado ao usuário
        const postNew = new Post({
          ...newPost,
          userId,
          slug: slug,
        });
        // Salvar o novo post
        await postNew.save();
        return postNew;
      } catch (error) {
        throw new Error(`Erro ao criar o post: ${error.message}`);
      }
    },

    deletePost: async (_, { postId }, { userId }) => {
      try {
        if (!userId) {
          throw new Error(
            "Usuário não autenticado. Faça login para continuar."
          );
        }

        // Verificar se o post existe
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error("Post não encontrado.");
        }

        // Verificar se o usuário é o proprietário do post
        if (post.userId !== userId) {
          throw new Error(
            "Você não tem autorização para excluir essa postagem."
          );
        }

        // Deletar o post
        await Post.findByIdAndDelete(postId);

        return {
          success: true,
          message: "A postagem foi removida com sucesso.",
        };
      } catch (error) {
        throw new Error(`Erro ao deletar o post: ${error.message}`);
      }
    },

    updatePost: async (_, { id, updatedPost }, { userId }) => {
      try {
        if (!userId) {
          throw new Error(
            "Usuário não autenticado. Faça login para continuar."
          );
        }
        // Verificar se o post existe
        console.log(id);
        const post = await Post.findById(id);
        console.log(post);
        if (!post) {
          throw new Error("Post não encontrado.");
        }
        // Verificar se o usuário é o proprietário do post
        if (post.userId !== userId) {
          throw new Error(
            "Você não tem autorização para alterar essa postagem."
          );
        }
        const newSlug = slugify(updatedPost.title, { lower: true });

        Object.assign(post, {
          ...updatedPost,
          slug: newSlug,
        });

        await post.save();

        return {
          success: true,
          message: "Post atualizado com sucesso.",
          title: post.title,
          content: post.content,
          image: post.image,
          category: post.category,
          id: post.id,
        };
      } catch (error) {
        throw new Error(`Erro ao atualizar postagem: ${error.message}`);
      }
    },
  },
};

export default postResolver;
