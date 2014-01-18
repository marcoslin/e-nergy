# Setup for baasbox-0.7.2
0. Download baasbox via http://www.baasbox.com/download-page/
1. unzip
2. chmod 755 start
3. start

# Usage
1. Go to http://localhost:9000/
2. Login as admin, use i icon to populate the default values
3. Go to "Main" and choose "Collections"
4. Click on "New Collection"
5. Use postman to create post, need to add following headers:
   a. Use basic authentication (uid/pwd): admin/admin
   b. Set "x-baasbox-appcode" to "1234567890" (use the default provided by baasbox)
   c. Set "Content-Type" to "application/json" 
6. Post "raw" json as text
7. To see the data
   a. Go back to baasbox console, under MAIN, choose Documents
   b. Use GET at http://localhost:9000/document/meters, same header as POST


