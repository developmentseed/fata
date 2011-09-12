require 'yaml'
require 'csv'

def write(filename, hash)
  File.open(filename, 'w') do |f|
    f.write(hash.to_yaml)
    f.write('---')
  end
end

def csv(filename)
  data = []
  headers = []
  CSV.read(filename).each_with_index do |row, index|
    if index == 0
      row.each do |cell|
        headers.push(cell.to_s)
      end
    else
      r = {}
      data.push(r)
      row.each_with_index do |cell, col|
        if /[+-]?(\d+)(\.\d+)/ =~ cell
          r[headers[col]] = cell.to_f
        elsif /[+-]?(\d+)/ =~ cell
          r[headers[col]] = cell.to_i
        elsif cell.to_s != ''
          r[headers[col]] = cell.to_s
        end
      end
    end
  end
  data
end

def plus(hash, group, key, value)
  hash[group] = hash[group] || {}
  hash[group][key] = hash[group][key] || {}
  hash[group][key][value] = (hash[group][key][value] || 0) + 1
  hash[group][key]['total'] = (hash[group][key]['total'] || 0) + 1
end

# Final data hash.
data = {'category' => 'data', 'fata' => {}}

# Import drone aggregates per agency.
csv('_data/fata_drone_aggregates.csv').each do |record|
  data[record['agency']] = data[record['agency']] || {}
  data[record['agency']]['drone'] = record
end

# Import question aggregates per agency.
csv('_data/fata_variables.csv').each do |record|
  data[record['Agency']] = data[record['Agency']] || {}
  record.each do |key,value|
    [data[record['Agency']], data['fata']].each do |scope|
      if /Q\d+/ =~ key
        # agency['data'][key] = agency['data'][key] || {}
        plus(scope, 'All', key, value)

        # Gender
        if record['D1'] == 'Male'
          plus(scope, 'Gender/Male', key, value)
        elsif record['D1'] = 'Female'
          plus(scope, 'Gender/Female', key, value)
        end

        # Age
        if !record['D2'].is_a? Fixnum
        elsif record['D2'] >= 18 and record['D2'] <= 25
          plus(scope, 'Age/18-25', key, value)
        elsif record['D2'] >= 26 and record['D2'] <= 39
          plus(scope, 'Age/26-39', key, value)
        elsif record['D2'] >= 40 and record['D2'] <= 54
          plus(scope, 'Age/40-54', key, value)
        elsif record['D2'] >= 55
          plus(scope, 'Age/55+', key, value)
        end

        # Years of Education
        if !record['D3'].is_a? Fixnum
        elsif record['D3'] == 0
          plus(scope, 'Years of Education/0', key, value)
        elsif record['D3'] >= 1 and record['D3'] <= 7
          plus(scope, 'Years of Education/1-7', key, value)
        elsif record['D3'] >= 8 and record['D3'] <= 11
          plus(scope, 'Years of Education/8-11', key, value)
        elsif record['D3'] >= 12
          plus(scope, 'Years of Education/12+', key, value)
        end

        # Marital status
        if record['D7a'] == 'Married'
          plus(scope, 'Marital Status/Married', key, value)
        elsif record['D7a'] == 'Single' or record['D7a'] == 'Widowed or Divorced'
          plus(scope, 'Marital Status/Unmarried', key, value)
        end

        # Income level
        if ["Rs. 10,001 – 15,000", "Rs. 15,001 or more"].include?(record['D8'])
          plus(scope, 'Income Level/High', key, value)
        elsif ["Rs. 1,001 – 3,000", "Rs. 3,001 – 5,000", "Rs. 5,001 – 7,000", "Rs. 7,001 – 10,000"]
          plus(scope, 'Income Level/Low', key, value)
        end
      end
    end
  end
end

write('_posts/data/0200-01-01-data.txt', data)

