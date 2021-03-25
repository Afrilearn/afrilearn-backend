import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: mongoose.Schema.ObjectId,
      ref: 'cmsRoles',
    },
    isActivated: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
UserSchema.virtual('recentActivities', {
  ref: 'recentActivity',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});
// UserSchema.methods.toJSON = function RemovePassword() {
//   const obj = this.toObject();
//   delete obj.password;
//   return obj;
// };

const CmsUser = mongoose.model('cmsUser', UserSchema);

export default CmsUser;
