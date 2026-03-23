import mongoose from "mongoose"

const knowledgeSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  content: {
    type: String
  },

  type: {
    type: String,
    enum: ["article", "video", "tweet", "image", "pdf", "note"],
    default: "article"
  },

  source: {
    type: String
  },

  tags: [{
    type: String
  }],

  embedding: [{
    type: Number
  }],

  relatedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Knowledge"
  }],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true })

const Knowledge = mongoose.model("Knowledge", knowledgeSchema)

export default Knowledge