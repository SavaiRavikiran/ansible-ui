
import React from "react";
import { HelpTooltip } from "../HelpTooltip";
import DocDrawer from "../DocDrawer";

export const PlaybookNameHelp = () => (
  <HelpTooltip
    title="Playbook Naming"
    content={
      <div className="space-y-2">
        <p>Name your playbook with a descriptive name that indicates its purpose.</p>
        <p>Best practices:</p>
        <ul className="list-disc pl-5">
          <li>Use lowercase letters</li>
          <li>Use hyphens instead of spaces</li>
          <li>End with .yml or .yaml extension</li>
          <li>Example: setup-web-servers.yml</li>
        </ul>
      </div>
    }
  />
);

export const PlaybookContentHelp = () => (
  <HelpTooltip
    title="Playbook Content"
    content={
      <div className="space-y-2">
        <p>Playbooks use YAML syntax to describe automation tasks.</p>
        <p>Basic structure:</p>
        <ul className="list-disc pl-5">
          <li>Start with --- (YAML document start)</li>
          <li>Define hosts the playbook will run on</li>
          <li>Add tasks with name and module</li>
          <li>Indent properly (2 spaces per level)</li>
        </ul>
      </div>
    }
  />
);

export const PlaybookDocumentation = () => (
  <DocDrawer
    title="Ansible Playbooks Guide"
    description="Learn how to create and use Ansible playbooks effectively"
  >
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">What are Playbooks?</h3>
        <p>
          Playbooks are Ansible's configuration, deployment, and orchestration language.
          They describe a policy you want your systems to enforce, or a set of steps in a
          general IT process.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Playbook Structure</h3>
        <p>A playbook is composed of one or more 'plays' in an ordered list.</p>
        <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
{`---
- name: Web servers configuration
  hosts: webservers
  become: yes
  
  tasks:
    - name: Ensure Apache is installed
      apt:
        name: apache2
        state: present
        
    - name: Ensure Apache is running
      service:
        name: apache2
        state: started
        enabled: yes`}
        </pre>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Key Playbook Components</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>hosts</strong>: Specifies which hosts or host groups from your inventory the play runs on
          </li>
          <li>
            <strong>become</strong>: Whether to use privilege escalation (sudo)
          </li>
          <li>
            <strong>vars</strong>: Variables used in the playbook
          </li>
          <li>
            <strong>tasks</strong>: A list of actions to perform
          </li>
          <li>
            <strong>handlers</strong>: Tasks that only run when notified
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Best Practices</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Always name your tasks descriptively</li>
          <li>Use comments (# comment) to explain complex logic</li>
          <li>Keep playbooks simple and focused on a specific goal</li>
          <li>Use roles for reusable content</li>
          <li>Use variables for values that might change</li>
          <li>Test playbooks with --check flag before running them</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Common Modules</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>apt/yum</strong>: Package management</li>
          <li><strong>service</strong>: Manage services</li>
          <li><strong>copy/template</strong>: Transfer files</li>
          <li><strong>file</strong>: Manage files and directories</li>
          <li><strong>command/shell</strong>: Run commands</li>
          <li><strong>user</strong>: Manage user accounts</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Running Playbooks</h3>
        <p>To run a playbook:</p>
        <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
{`ansible-playbook playbook.yml -i inventory`}
        </pre>
        <p>Common options:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><code>--check</code>: Test mode (no changes)</li>
          <li><code>--diff</code>: Show differences</li>
          <li><code>--limit host1,host2</code>: Run on specific hosts only</li>
          <li><code>--tags tag1,tag2</code>: Run specific tagged tasks</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Resources</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <a 
              href="https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Ansible Playbooks Documentation
            </a>
          </li>
          <li>
            <a 
              href="https://docs.ansible.com/ansible/latest/getting_started/get_started_playbook.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Getting Started with Playbooks
            </a>
          </li>
        </ul>
      </section>
    </div>
  </DocDrawer>
);
