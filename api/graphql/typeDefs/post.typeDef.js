const postTypeDef = `#graphql

type Post {
    id: ID!
    userId: ID!
    title: String!
    content: String!
    image: String!
    category: String!
    slug: String
    comment: [Comment!]
}

type Query {
    allPosts: [Post!]!
    onePost(id: ID!): Post
}

type Mutation {
    createPost(newPost: NewPostInput!): Post
    deletePost(postId: ID!): DeletePostResponse
    updatePost(id: ID!,  updatedPost: UpdatePostInput!): UpdatePostResponse
}

input NewPostInput {
    userId: String!
    title: String!
    content: String!
    image: String!
    category: String!
}

type DeletePostResponse {
  success: Boolean!
  message: String
}

input UpdatePostInput {
    title: String
    content: String
    image: String
    category: String
    slug: String
}

type UpdatePostResponse {
    success: Boolean!
    message: String
    title: String
    content: String
    image: String
    category: String
    slug: String

}

`;

export default postTypeDef;
