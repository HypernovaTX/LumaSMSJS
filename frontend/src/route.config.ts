const routes = {
  // Common
  _index: '/',
  commonBestof: '/bestof',
  commonRules: '/rules',
  commonStaff: '/staff',

  // Discussion (forums)
  forum: '/discussions',

  // Profile (for logged in users)
  profile: '/profile',
  profileDM: '/profile/messages',
  profileFavorites: '/profile/favorites',
  profileNotifications: '/profile/notifications',
  profileSettings: '/profile/preferences',
  profileSubmissions: '/profile/uploads',
  profileSubmit: '/profile/submit',

  // Staff
  staff: '/staffcp',

  // Submission
  subGame: '/games',
  subGameSubmit: '/games/submit',
  subGameUpdate: '/games/update',
  // Submission - Graphics
  subGfx: '/graphics',
  subGfxSubmit: '/graphics/submit',
  subGfxUpdate: '/graphics/update',
  // Submission - Hacks
  subHack: '/hacks',
  subHackSubmit: '/hacks/submit',
  subHackUpdate: '/hacks/update',
  // Submission - Misc
  subMisc: '/misc',
  subMiscSubmit: '/misc/submit',
  subMiscUpdate: '/misc/update',
  // Submission - Models
  subModel: '/models',
  subModelSubmit: '/models/submit',
  subModelUpdate: '/models/update',
  // Submission - Reviews
  subReview: '/review',
  subReviewSubmit: '/review/submit',
  subReviewUpdate: '/review/update',
  // Submission - Sounds
  subSfx: '/sounds',
  subSfxSubmit: '/sounds/submit',
  subSfxUpdate: '/sounds/update',
  // Submission - Tutorials
  subHowto: '/tutorials',
  subHowtoSubmit: '/tutorials/submit',
  subHowtoUpdate: '/tutorials/update',

  // Users
  user: '/user',
  userLogin: '/login',
  userLogout: '/logout',
  userRegister: '/register',

  // URLs
  urlDiscord: 'https://discord.gg/jchgfw5',
  urlTwitter: 'https://twitter.com/OfficialMFGG',
  urlWiki: 'https://wiki.mfgg.net/',
} as const;
export default routes;
