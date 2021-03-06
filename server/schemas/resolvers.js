const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models/index');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks')


                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        //     addBook: async (parent, { thoughtId, reactionBody }, context) => {
        //         if (context.user) {
        //             const updatedThought = await Thought.findOneAndUpdate(
        //                 { _id: thoughtId },
        //                 { $push: { reactions: { reactionBody, username: context.user.username } } },
        //                 { new: true, runValidators: true }
        //             );

        //             return updatedThought;
        //         }

        //         throw new AuthenticationError('You need to be logged in!');
        //     },
    }
}

module.exports = resolvers