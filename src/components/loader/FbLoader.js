import React from "react";
import ContentLoader from "react-content-loader";

export default function FbLoader() {
  return   <ContentLoader 
  speed={0.8}
  width={1000}
  height={70}
  viewBox="0 0 1000 70"
  backgroundColor="#f3f3f3"
  foregroundColor="#dbd6d6"
  className="sv-fb-loader"
>
  <rect x="0" y="26" rx="3" ry="3" width="400" height="8" /> 
  <rect x="0" y="56" rx="3" ry="3" width="1000" height="8" /> 
  <rect x="0" y="72" rx="3" ry="3" width="1000" height="8" /> 
</ContentLoader>
}
