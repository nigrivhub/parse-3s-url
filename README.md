# parse-s3-url

One-file utility to get bucket name, region and key having S3 referency in all supported formats.

```js
import parseS3Url from "@nigrivhub/parse-s3-url";

console.log(parseS3Url("s3://bucket_name/object.txt"));
console.log(parseS3Url("arn:aws:s3:::bucket_name/object.txt"));
console.log(parseS3Url("https://s3.eu-west-1.amazonaws.com/bucket_name/object.txt"));
```

Support with formats before 2020: yes
Dependencies: 0
License: MIT
