---
작성일: <% tp.date.now() %>
---
<% await tp.file.rename(moment().subtract(1, 'weeks').format("YYYY-[W]ww")) %>