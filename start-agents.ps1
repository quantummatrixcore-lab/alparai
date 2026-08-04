tmux kill-session -t alpar-agents 2>$null
tmux new-session -d -s alpar-agents
tmux send-keys -t alpar-agents "claude" C-m
tmux split-window -h
tmux send-keys -t alpar-agents "echo 'Antigravity (Gemini Flash) Calisma Alani Hazir!'" C-m
tmux split-window -v
tmux send-keys -t alpar-agents "opencode" C-m
tmux attach-session -t alpar-agents
