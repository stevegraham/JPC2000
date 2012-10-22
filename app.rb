require 'sinatra'

set :public_folder, File.dirname(__FILE__) + '/app'

get '/' do
  redirect '/index.html'
end

post '/2010-04-01/Accounts/ACcba016ddb51e3e57670d57953acea484/SMS/Messages' do
  puts request.inspect
end
