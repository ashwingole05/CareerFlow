/** @type {import('next').NextConfig} */
const nextConfig = {
   reactCompiler: true,
 images:{
  remotePatterns:[
    {
      protocol:"https",
      hostname:"randomuser.me",
    },
  ],
 },

  
};

export default nextConfig;
