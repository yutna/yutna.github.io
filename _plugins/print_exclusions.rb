Jekyll::Hooks.register :site, :after_init do |site|
  puts "*" * 74
  excluded_items = site.config["exclude"].sort
  puts "Excluded items:"
  excluded_items.each { |item| puts " - #{item}" }
  puts "*" * 74
end
