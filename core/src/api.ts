export const sessionTokenHeaderName = "boop-token";

// TODO keep private key secret
// for now the prototype has the vapid keys directly in source code, but we should eventually store it securely
// and then generate a new pair of keys that are not checked into version control
export const vapidKeys = {
  "publicKey": "BHFciY9_wuokC43Tkd7g4bPYctnTFlqc1rHzKgShdTxE2_AJFAvSJz1q3QXf4OQKDp0CcrDM4CK8mIPfG17iv78",
  "privateKey": "HDlJaMhdqp3W8NjwLy34Gi_163wWRPCeZAwYk5Z-ml4"
};;
