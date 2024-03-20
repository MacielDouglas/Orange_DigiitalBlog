import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userResolver = {
  Query: {
    allUsers: () => User.find().exec(),
    oneUser: (_, { id }) => User.findById(id).exec(),
  },

  Mutation: {
    createUser: async (_, { user }) => {
      try {
        // Verificar se o e-mail já está em uso
        const existingEmail = await User.findOne({ email: user.email });
        if (existingEmail) {
          throw new Error(
            "Este e-mail já está em uso. Por favor, use outro e-mail."
          );
        }

        // Verificar se o nome de usuário já está em uso
        const existingUsername = await User.findOne({
          username: user.username,
        });
        if (existingUsername) {
          throw new Error(
            "Este nome de usuário já está em uso. Por favor, escolha outro nome de usuário."
          );
        }

        // Criptografar a senha antes de salvar o usuário
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = new User({ ...user, password: hashedPassword });
        await newUser.save();
        return newUser;
      } catch (error) {
        throw new Error(`Erro ao criar usuário: ${error.message}`);
      }
    },

    deleteUser: async (_, { id }) => {
      try {
        // Verificar se o usuário existe pelo ID fornecido
        const existingUser = await User.findById(id);
        if (!existingUser) {
          throw new Error("Usuário não encontrado.");
        }

        // Se o usuário existe, excluí-lo
        await User.findByIdAndDelete(id);
        return {
          success: true,
          message: `Usuário: ${existingUser.username}, foi excluído com sucesso.`,
        };
      } catch (error) {
        // Se houver algum erro, lançar uma exceção
        throw new Error(`Erro ao excluir usuário: ${error.message}`);
      }
    },
    updateUser: async (_, { id, updatedUser }) => {
      try {
        // Verificar se o usuário existe pelo ID fornecido
        const existingUser = await User.findById(id);
        if (!existingUser) {
          throw new Error("Usuário não encontrado.");
        }

        // Se o usuário existir, atualize-o com os novos dados
        const hashedPassword = await bcrypt.hash(updatedUser.password, 10);

        Object.assign(existingUser, {
          ...updatedUser,
          password: hashedPassword,
        });
        await existingUser.save();

        return {
          success: true,
          message: "Usuário atualizado com sucesso.",
        };
      } catch (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }
    },

    loginUser: async (_, { email, password }) => {
      try {
        // Verificar se o usuário existe pelo e-mail fornecido
        const user = await User.findOne({ email }).select("+password");
        // console.log("User: ", user);

        if (!user) {
          throw new Error("Credenciais inválidas.");
        }

        // Verificar se a senha está correta
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(passwordMatch);
        if (!passwordMatch) {
          throw new Error("Credenciais inválidas.");
        }

        // Gerar token de autenticação
        const token = jwt.sign(
          { userId: user.id, isAdmin: user.isAdmin },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        // Retornar token e indicador de isAdmin
        return { token };
        // return { token, isAdmin: user.isAdmin };
      } catch (error) {
        throw new Error(`Erro ao fazer login: ${error.message}`);
      }
    },
  },
};

export default userResolver;
