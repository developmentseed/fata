require 'rubygems'
require 'json'
require 'yaml'

def write(filename, hash, footer)
  File.open(filename, 'w') do |f|
    f.write(hash.to_yaml)
    f.write("---\n")
    f.write(footer)
  end
end

source = ""
File.open("_data/fata_questions.json", "r") do |infile|
  while (line = infile.gets)
    source = source + line
  end
end

source = JSON.parse(source)
source.each_with_index do |group, index|
  filename = '0200-01-' + (index >= 9 ? '' : '0') + (index+1).to_s + '-' + group['id'] + '.txt'
  content = {'category' => 'questions', 'layout' => 'questions', 'title' => group['shortname'], 'key' => group['group']}
  content['questions'] = []
  group['questions'].each do |qid,q|
    content['questions'].push({'key' => qid, 'title' => q['name'] })
  end
  if group['answers']
    content['answers'] = []
    group['answers'].each do |a|
      content['answers'].push(a['name'])
    end
  end
  write('_posts/questions/' + filename, content, group['text'])
end
