require 'sinatra'

set :public_folder, File.dirname(__FILE__) + '/app'

get '/' do
  redirect '/index.html'
end

