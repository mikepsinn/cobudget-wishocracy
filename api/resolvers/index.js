import _ from 'lodash';
import slugify from 'slugify';

const resolvers = {
  Query: {
    currentUser: (parent, args, { currentUser }) => {
      return currentUser;
    },
    events: async (parent, args, { models: { Event } }) => {
      return Event.find();
    },
    event: async (parent, { slug }, { models: { Event } }) => {
      return Event.findOne({ slug });
    },
    dream: async (parent, { slug }, { models: { Dream } }) => {
      return Dream.findOne({ slug });
    }
  },
  Mutation: {
    createEvent: async (
      parent,
      { slug, title, description },
      { currentUser, models: { Event, Membership } }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      const event = await new Event({ slug, title, description });

      await new Membership({
        userId: currentUser._id,
        eventId: event._id,
        isAdmin: true
      }).save();

      return event.save();
    },
    createDream: async (
      parent,
      { eventId, title, description, budgetDescription, minFunding },
      { currentUser, models: { Membership, Dream } }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      const member = await Membership.findOne({
        userId: currentUser.id,
        eventId
      });

      if (!member) throw new Error('You are not a member of this event');

      return new Dream({
        eventId,
        title,
        slug: slugify(title),
        description,
        teamIds: [currentUser.id],
        budgetDescription,
        minFunding
      }).save();
    },
    createUser: async (parent, { name, email }, { models: { User } }) => {
      return new User({ name, email }).save();
    },
    dropStuff: async (parent, args, { models: { Event, Membership } }) => {
      await Event.collection.drop();
      await Membership.collection.drop();
      return true;
    }
  },
  User: {
    memberships: async (user, args, { models: { Membership } }) => {
      return Membership.find({ userId: user.id });
    }
  },
  Membership: {
    user: async (membership, args, { models: { User } }) => {
      return User.findOne({ _id: membership.userId });
    },
    event: async (membership, args, { models: { Event } }) => {
      return Event.findOne({ _id: membership.eventId });
    }
  },
  Event: {
    memberships: async (event, args, { models: { Membership } }) => {
      return Membership.find({ eventId: event.id });
    },
    dreams: async (event, args, { models: { Dream } }) => {
      return Dream.find({ eventId: event.id });
    }
  },
  Dream: {
    team: async (dream, args, { models: { User } }) => {
      return User.find({ _id: { $in: dream.teamIds } });
    },
    event: async (dream, args, { models: { Event } }) => {
      return Event.find({ _id: dream.eventId });
    }
  }
};

export default resolvers;
